package com.hawazin.visualrater.configurations

import com.hawazin.visualrater.graphql.CustomRestTemplateCustomizer
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration


@Configuration
class AppConfiguration {
    @Bean
    fun customRestTemplateCustomizer() = CustomRestTemplateCustomizer()
}