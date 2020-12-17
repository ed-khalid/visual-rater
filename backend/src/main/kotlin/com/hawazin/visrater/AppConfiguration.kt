package com.hawazin.visrater

import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration


@Configuration
class AppConfiguration {
    @Bean
    fun customRestTemplateCustomizer() = CustomRestTemplateCustomizer()
}