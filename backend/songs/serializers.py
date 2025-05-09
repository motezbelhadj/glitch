from rest_framework import serializers
from .models import Song, Playlist

class SongSerializer(serializers.ModelSerializer):
    uploader_username = serializers.ReadOnlyField(source='uploader.username')
    
    class Meta:
        model = Song
        fields = (
            'id', 'title', 'artist', 'album', 'genre', 'year', 'duration',
            'audio_file', 'cover_image', 'is_famous', 'uploader', 'uploader_username',
            'created_at', 'updated_at'
        )
        read_only_fields = ('id', 'created_at', 'updated_at', 'uploader', 'uploader_username')

class PlaylistSerializer(serializers.ModelSerializer):
    songs = SongSerializer(many=True, read_only=True)
    song_ids = serializers.PrimaryKeyRelatedField(
        many=True, 
        write_only=True,
        queryset=Song.objects.all(),
        required=False,
        source='songs'
    )
    
    class Meta:
        model = Playlist
        fields = (
            'id', 'name', 'description', 'cover_image', 'user',
            'songs', 'song_ids', 'is_public', 'created_at', 'updated_at'
        )
        read_only_fields = ('id', 'created_at', 'updated_at', 'user')
