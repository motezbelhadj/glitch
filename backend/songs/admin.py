from django.contrib import admin
from .models import Song, Playlist


@admin.register(Song)
class SongAdmin(admin.ModelAdmin):
    list_display = ('title', 'artist', 'genre', 'is_famous', 'uploader', 'created_at')
    list_filter = ('is_famous', 'genre')
    search_fields = ('title', 'artist', 'album')

@admin.register(Playlist)
class PlaylistAdmin(admin.ModelAdmin):
    list_display = ('name', 'user', 'is_public', 'created_at')
    list_filter = ('is_public',)
    search_fields = ('name', 'description')
