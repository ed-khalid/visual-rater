package com.hawazin.visrater.configurations

import org.springframework.boot.context.properties.ConfigurationProperties

@ConfigurationProperties(prefix = "image-service")
class ImageServiceConfiguration(val uri:String) {
}