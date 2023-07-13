rootProject.name = "visrater"

pluginManagement.resolutionStrategy.eachPlugin {
    if (requested.id.id.startsWith("org.jetbrains.kotlin")) {
        useVersion("1.8.0")
    }
}