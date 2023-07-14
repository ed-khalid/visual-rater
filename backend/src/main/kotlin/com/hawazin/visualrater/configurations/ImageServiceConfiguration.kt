package com.hawazin.visualrater.configurations

import org.springframework.boot.context.properties.ConfigurationProperties

@ConfigurationProperties(prefix = "image-service")
class ImageServiceConfiguration(val uri:String) {
}