# Generated by Django 4.2.7 on 2025-05-06 09:24

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion
import songs.models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Song',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(max_length=255)),
                ('artist', models.CharField(max_length=255)),
                ('album', models.CharField(blank=True, max_length=255)),
                ('genre', models.CharField(blank=True, max_length=100)),
                ('year', models.IntegerField(blank=True, null=True)),
                ('duration', models.IntegerField(blank=True, null=True)),
                ('audio_file', models.FileField(upload_to=songs.models.song_file_path)),
                ('cover_image', models.ImageField(blank=True, null=True, upload_to=songs.models.cover_image_path)),
                ('is_famous', models.BooleanField(default=False)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('uploader', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='uploaded_songs', to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='Playlist',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=255)),
                ('description', models.TextField(blank=True)),
                ('cover_image', models.ImageField(blank=True, null=True, upload_to='playlist_covers/')),
                ('is_public', models.BooleanField(default=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('songs', models.ManyToManyField(blank=True, related_name='playlists', to='songs.song')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='playlists', to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]
