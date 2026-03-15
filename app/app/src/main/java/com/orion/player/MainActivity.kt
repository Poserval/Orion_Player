package com.orion.player

import android.os.Bundle
import android.widget.ArrayAdapter
import android.widget.ListView
import androidx.appcompat.app.AppCompatActivity
import androidx.media3.common.MediaItem
import androidx.media3.common.Player
import androidx.media3.exoplayer.ExoPlayer
import androidx.media3.session.MediaSession
import androidx.media3.ui.PlayerView

class MainActivity : AppCompatActivity() {

    private var player: ExoPlayer? = null
    private var mediaSession: MediaSession? = null
    private lateinit var playerView: PlayerView

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_player)

        playerView = findViewById(R.id.player_view)

        // Создаем плеер
        player = ExoPlayer.Builder(this).build()
        playerView.player = player

        // ВАЖНО: Это заставит систему увидеть наш плеер!
        mediaSession = MediaSession.Builder(this, player!!).build()

        // Тестовые файлы (потом заменим на настоящие)
        val testFiles = listOf(
            "Песня 1 - Исполнитель 1",
            "Песня 2 - Исполнитель 2",
            "Песня 3 - Исполнитель 3"
        )

        val listView = findViewById<ListView>(R.id.file_list)
        val adapter = ArrayAdapter(this, android.R.layout.simple_list_item_1, testFiles)
        listView.adapter = adapter

        // При клике на файл - ставим тестовый URL (потом заменим)
        listView.setOnItemClickListener { _, _, position, _ ->
            playTestFile(position)
        }
    }

    private fun playTestFile(index: Int) {
        // ТЕСТОВЫЙ URL (потом заменим на путь к реальному файлу)
        val testUrls = listOf(
            "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
            "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
            "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3"
        )

        val mediaItem = MediaItem.fromUri(testUrls[index])
        player?.setMediaItem(mediaItem)
        player?.prepare()
        player?.play()
    }

    override fun onStart() {
        super.onStart()
        player?.prepare()
    }

    override fun onStop() {
        super.onStop()
        player?.pause()
    }

    override fun onDestroy() {
        mediaSession?.release()
        player?.release()
        super.onDestroy()
    }
}
