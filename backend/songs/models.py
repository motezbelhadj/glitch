from django.db import models
from django.conf import settings

def song_file_path(instance, filename):
    return f'songs/{instance.id}/{filename}'

def cover_image_path(instance, filename):
    return f'covers/{instance.id}/{filename}'

class Song(models.Model):
    title = models.CharField(max_length=255)
    artist = models.CharField(max_length=255)
    album = models.CharField(max_length=255, blank=True)
    genre = models.CharField(max_length=100, blank=True)
    year = models.IntegerField(null=True, blank=True)
    duration = models.IntegerField(null=True, blank=True)  # Duration in seconds
    audio_file = models.FileField(upload_to=song_file_path)
    cover_image = models.ImageField(upload_to=cover_image_path, blank=True, null=True)
    is_famous = models.BooleanField(default=False)
    uploader = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='uploaded_songs',
        null=True,
        blank=True
    )
    likes = models.ManyToManyField(
        settings.AUTH_USER_MODEL, 
        related_name='liked_songs',
        blank=True
    )
    dislikes = models.ManyToManyField(
        settings.AUTH_USER_MODEL, 
        related_name='disliked_songs',
        blank=True
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.title} - {self.artist}"
    
    @property
    def like_count(self):
        return self.likes.count()
    
    @property
    def dislike_count(self):
        return self.dislikes.count()

class Playlist(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    cover_image = models.ImageField(upload_to='playlist_covers/', blank=True, null=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='playlists')
    songs = models.ManyToManyField(Song, related_name='playlists', blank=True)
    is_public = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name
