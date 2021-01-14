package com.hawazin.visrater.configurations

import org.springframework.boot.context.properties.ConfigurationProperties
import org.springframework.boot.context.properties.ConstructorBinding

@ConstructorBinding
@ConfigurationProperties(prefix = "image-service")
class ImageServiceConfiguration(val uri:String) {
}