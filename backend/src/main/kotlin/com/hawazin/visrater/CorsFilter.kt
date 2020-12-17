package com.hawazin.visrater

import org.springframework.context.annotation.Configuration
import javax.servlet.Filter
import javax.servlet.FilterChain
import javax.servlet.ServletRequest
import javax.servlet.ServletResponse
import javax.servlet.http.HttpServletResponse

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