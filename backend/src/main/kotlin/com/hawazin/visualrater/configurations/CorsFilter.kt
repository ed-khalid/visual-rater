package com.hawazin.visrater.configurations

import org.springframework.context.annotation.Configuration
import jakarta.servlet.Filter
import jakarta.servlet.FilterChain
import jakarta.servlet.ServletRequest
import jakarta.servlet.ServletResponse
import jakarta.servlet.http.HttpServletResponse

@Configuration
class CorsFilter : Filter {
    override fun doFilter(request: ServletRequest?, response: ServletResponse?, chain: FilterChain?) {
        val servletResponse = response as HttpServletResponse
        servletResponse.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
        servletResponse.setHeader("Access-Control-Allow-Methods", "POST, GET, PUT, OPTIONS, DELETE, PATCH");
        servletResponse.setHeader("Access-Control-Max-Age", "3600");
        servletResponse.setHeader("Access-Control-Allow-Headers", "Origin, Content-Type, Accept");
        servletResponse.setHeader("Access-Control-Allow-Credentials", "true");
        chain?.doFilter(request, servletResponse);
    }
}