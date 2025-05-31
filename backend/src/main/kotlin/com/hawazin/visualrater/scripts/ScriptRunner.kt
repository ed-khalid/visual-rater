package com.hawazin.visualrater.scripts

import org.springframework.boot.CommandLineRunner
import org.springframework.context.ConfigurableApplicationContext
import org.springframework.context.annotation.Profile
import org.springframework.stereotype.Component

@Component
@Profile("script")
class ScriptRunner(
    // private val thumbnailUpdater: UpdateThumbnailsScript,
    private val dominantColorUpdater: UpdateDominantColors,
    private val context: ConfigurableApplicationContext,
    ) : CommandLineRunner {

    override fun run(vararg args: String?) {
        println("Script Runner for One Off Tasks")
        // thumbnailUpdater.updateThumbnails()
        dominantColorUpdater.updateDominantColors()
        context.close()
    }
}