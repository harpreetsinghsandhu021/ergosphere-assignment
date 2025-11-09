import os
from django.shortcuts import render
from django.http import HttpResponse, StreamingHttpResponse
from rest_framework import viewsets, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.generics import GenericAPIView
from .serializers import (
    ConversationListSerializer,
    ConversationDetailSerializer,
    MessageSerializer
)
import time
from .models import Conversation, Message
from django.db.models import Q
from django.db import models
from dotenv import load_dotenv
from datetime import datetime
import numpy as np
from google import genai
from google.genai import types


load_dotenv()

client = genai.Client()

# Create your views here.
def index(request):
    return HttpResponse("Chat api is working as intended!!!!!")

class ConversationViewSet(viewsets.ReadOnlyModelViewSet):
    """
    This Viewset provides the 'list' (GET /api/conversations/)
    and 'retrieve' (GET /api/conversation/<id>/) endpoints.

    It's 'read-only' because we will create conversations via the /chat/ endpoint,
    not by POST-ing to /conversations/. This is a good design choice.
    """
    queryset = Conversation.objects.all()

    def get_serializer_class(self):
        if self.action == 'list':
            return ConversationListSerializer
        return ConversationDetailSerializer



def _stream_llm_response(conversation: Conversation, chat_history: list):
    """
    This is a generator function that:
    1. Gets a streaming response from Gemini.
    2. Yields (streams) each chunk of text to the frontend.
    3. Saves the full AI response to the database after the stream is done.
    4. Triggers the AI analysis (summary and embedding) after the message is saved
    """

    # --- Stream and Save the Chat Response ---
    try:
         response = client.models.generate_content_stream(model='gemini-2.5-flash',contents=chat_history)

         full_response_buffer = []
         for chunk in response:
             if chunk.text:
                 yield chunk.text
                 full_response_buffer.append(chunk.text)

         full_ai_response = "".join(full_response_buffer)

         #  Now that the stream is done, save the full AI message
         Message.objects.create(
             conversation=conversation,
             sender=Message.SenderChoices.AI,
             content=full_ai_response
         )
         
    except Exception as e:
        print(f"Error during AI chat stream: {e}")
        yield f"Error: Could not get AI response. {e}"
        return


class ChatView(APIView):
    """
    This is the main chat endpoint for handling a user's message.
    It handles:
    1. Finding or creating a Conversation.
    2. Saving the user's message.
    3. Getting a response from the LLM.
    4. Saving the model's message.
    5. Returning the model's response.
    """

    def post(self, request, *args, **kwargs):
        user_message_content = request.data.get('message')
        conversation_id = request.data.get('conversation_id')

        if not user_message_content:
            return Response({"error":"Message content is required."}, status=status.HTTP_400_BAD_REQUEST)
        
        # Find or create the conversation
        if conversation_id:
            try:
                conversation = Conversation.objects.get(id=conversation_id)
                conversation.status = Conversation.StatusChoices.ACTIVE
                conversation.end_timestamp = None # Re-open the chat
                conversation.save()
            except Conversation.DoesNotExist:
                return Response({"error": "Invalid conversation_id"}, status=status.HTTP_404_NOT_FOUND)
        else:
            # Create a new conversation and use the first message as the title
            conversation = Conversation.objects.create(title=user_message_content[:50])

        # Save the user's message
        Message.objects.create(
            conversation=conversation,
            sender=Message.SenderChoices.USER,
            content=user_message_content
        )

        # Prepare chat history for Gemini
        chat_history = []
        for msg in conversation.messages.all().order_by('timestamp'):
            role = 'user' if msg.sender == Message.SenderChoices.USER else 'model'
            chat_history.append({"role": role, "parts": [{"text": msg.content}]})

        stream = _stream_llm_response(conversation, chat_history)
        return StreamingHttpResponse(stream, content_type='text/event-stream')


class SemanticSearchView(APIView):
    """
    This is the "Hybrid Search" endpoint.
    It performs a high-quality vector search on analyzed conversations AND a fallback
    keyword search on unanalyzed ones, then merges the results.
    """

    def post(self, request, *args, **kwargs):
        query = request.data.get('query')

        if not query:
            return Response({"error":"Query is required."}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # Generate vector for the user's query
            query_embedding_result = client.models.embed_content(model="gemini-embedding-001", contents=query,config=types.EmbedContentConfig(output_dimensionality=768))
            query_vector = list(query_embedding_result.embeddings[0].values)


            # "Smart Search" on Analyzed Conversations
            analyzed_convos = Conversation.objects.exclude(vector_embedding__isnull=True)

            semantic_scores = []
            for convo in analyzed_convos:
                convo_vector = np.array(convo.vector_embedding)

                similarity = cosine_similarity(query_vector, convo_vector)

                # Only include results with a reasonable similarity
                if similarity > 0.5:
                    semantic_scores.append((similarity, convo))
                
            # Sort by highest score
            semantic_scores.sort(key=lambda x: x[0], reverse=True)
            sorted_semantic_convos = [convo for similarity, convo in semantic_scores]

            # "Dumb Search" on Unanalyzed conversations
            # Find conversations that are NOT in the analyzed list
            # AND contain the query text in one of their messages.
            keyword_convos = Conversation.objects.filter(
                Q(vector_embedding__isnull=True) & Q(messages__content__icontains=query)
            ).distinct()

            # Merge Results
            # We will create a final list, prioritizing the semantic hits..
            # We use a set to ensure no duplicates are added.
            final_convos = []
            seen_ids = set()

            # Add the high-quality semantic matches first
            for convo in sorted_semantic_convos:
                if convo.id not in seen_ids:
                    final_convos.append(convo)
                    seen_ids.add(convo.id)

            # Add the keyword-based fallback matches
            for convo in keyword_convos:
                if convo.id not in seen_ids:
                    final_convos.append(convo)
                    seen_ids.add(convo.id)

            # Serialize and return 
            serializer = ConversationListSerializer(final_convos[:10], many=True)

            return Response(serializer.data, status=status.HTTP_200_OK)

        except Exception as e:
            print(f"Error during semantic search: {e}")
            return Response({"error": f"Search failed: {e}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

def cosine_similarity(v1, v2):
    dot_product = np.dot(v1, v2)
    norm_v1 = np.linalg.norm(v1)
    norm_v2 = np.linalg.norm(v2)
    if norm_v1 == 0 or norm_v2 == 0:
        return 0.0
    return dot_product / (norm_v1 * norm_v2)

class AnalyzeConversationView(GenericAPIView):
    """
    This is the endpoint for on-demand AI Analysis. It will:
    1. Get the full conversation history.
    2. Call Gemini to generate a summary and key points.
    3. Call Gemini to generate a vector embedding for the summary.
    4. Save all this data to the Conversation object.
    5. Return the full, updated conversation.
    """

    def post(self, request, *args, **kwargs):                
        try:
            id = self.kwargs.get('id')
            conversation = Conversation.objects.get(id=id)
        except:
            return Response({"error":"Conversation not found."}, status=status.HTTP_404_NOT_FOUND)
        
        full_chat_text = "\n".join(
            [f"{msg.sender}: {msg.content}" for msg in conversation.messages.all().order_by('timestamp')]
        )

        if not full_chat_text:
            return Response({"error":"Conversation is empty, nothing to analyze."}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            analysis_prompt = f"""
            Analyze the following conversation and provide a JSON object with a 1-sentence 'summary' and a list of 'key_points'.
            CONVERSATION:
            {full_chat_text}

            Provide *only* the raw JSON object.
            """

            analysis_response =  client.models.generate_content(model='gemini-2.5-flash', contents=analysis_prompt)

            json_str = analysis_response.text.strip().lstrip('```json').rstrip('```')
            import json

            analysis_data = json.loads(json_str)

            summary_text = analysis_data.get('summary', 'Summary not available.')
            key_points_list = analysis_data.get('key_points', [])

            embedding_result = client.models.embed_content(model="gemini-embedding-001", contents=summary_text,   config=types.EmbedContentConfig(output_dimensionality=768))
            vector = list(embedding_result.embeddings[0].values)


            conversation.summary = summary_text
            conversation.key_points = key_points_list
            conversation.vector_embedding = vector
            conversation.status = Conversation.StatusChoices.ENDED
            conversation.end_timestamp = datetime.now()
            conversation.save()

            return Response({"summary": summary_text, "key_points": key_points_list}, status=status.HTTP_200_OK)
        
        except Exception as e:
            print(f"Error during AI analysis: {e}")
            return Response({"error": f"AI analysis failed: {e}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


        