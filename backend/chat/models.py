from django.db import models

# This file defines the database structure for our chat application.
# We are using Django's built-in models, which is a powerful ORM.

class Conversation(models.Model):
    """
    Represents a single, complete conversation session.
    This model will store the metadata including title, start/end timestamps, and AI-generated summary.
    """

    # --- Choices for the 'status' field ---
    class StatusChoices(models.TextChoices):
        ACTIVE = 'active', 'Active'
        ENDED = 'ended', 'Ended'

    title = models.CharField(max_length=255, default="New Conversation")

    start_timestamp = models.DateTimeField(auto_now_add=True, help_text="When the conversation was started")
    end_timestamp = models.DateTimeField(null=True, blank=True, help_text="When the conversation was manually ended or archived")

    status = models.CharField(
        max_length=10,
        choices=StatusChoices.choices,
        default=StatusChoices.ACTIVE,
        help_text="The current status of the conversation (e.g., active, ended)"
    )

    # --- Fields for Conversation Intelligence ---

    # Stores the AI-generated summary of the entire chat.
    # We allow this to be blank or null because it's generated after the chat ends.
    summary = models.TextField(blank=True, null=True, help_text="AI-generated summary of the conversation.")

    # Stores AI-extracted key points, perhaps as a bulleted list
    key_points = models.TextField(blank=True, null=True, help_text="AI-generated key points, as a bulleted list or JSON.")

    # Stores the vector embedding for semantic search.
    # We use a JSONField to store the vector (a list of floats) in the database.
    vector_embedding = models.JSONField(blank=True, null=True, help_text="Vector embedding of the conversation summary for semantic search.")

    def __str__(self):
        return f"ID {self.id}: {self.title} ({self.status})"
    
    class Meta:
        # Order conversations by the newest first by default.
        ordering = ['-start_timestamp']

class Message(models.Model):
    """
    Represents a single message in a conversation session, with content, sender, timestamp, and a foreign key
    to the Conversation.
    """

    # --- Choices for the 'sender' field ---
    class SenderChoices(models.TextChoices):
        USER = 'user', 'User'
        AI = 'ai', 'AI'

    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE, related_name="messages", 
                                     help_text="The parent conversation this message belongs to")
    
    content = models.TextField()

    sender = models.CharField(max_length=10, choices=SenderChoices.choices, default=SenderChoices.USER)

    timestamp = models.DateTimeField(auto_now_add=True, help_text="When the message was created.")

    def __str__(self):
        return f"[{self.sender.upper()}] {self.content[:50]}..."
    
    class Meta:
        # Order messages by oldest first
        ordering = ['timestamp']