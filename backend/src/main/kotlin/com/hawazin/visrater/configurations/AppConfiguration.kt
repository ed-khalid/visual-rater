package com.hawazin.visrater.configurations

import com.hawazin.visrater.graphql.CustomRestTemplateCustomizer
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration


@Configuration
class AppConfiguration {
    @Bean
    fun customRestTemplateCustomizer() = CustomRestTemplateCustomizer()
}