from rest_framework import serializers
from .models import Conversation, Message

class MessageSerializer(serializers.ModelSerializer):
    """
    Serializes a single Message object.
    """

    class Meta:
        model = Message
        fields = ['id', 'conversation', 'sender', 'content', 'timestamp']
        read_only_fields = ['id', 'conversation', 'sender', 'timestamp']

class ConversationListSerializer(serializers.ModelSerializer):
    """
    Serializes a Conversation for the list view (e.g., in the sidebar).
    We only include metadata, not the full message history, to keep it fast.
    """

    class Meta:
        model = Conversation
        fields = ['id', 'title', 'start_timestamp', 'status']

class ConversationDetailSerializer(serializers.ModelSerializer):
    """
    Serializes a *single* Conversation, including all its messages.
    This is for the detailed chat view
    """

    messages = MessageSerializer(many=True, read_only=True)

    class Meta:
        model = Conversation
        fields = [
            'id',
            'title',
            'start_timestamp',
            'end_timestamp',
            'status',
            'summary',
            'key_points',
            'messages' # This is our nested list of all messages
        ]