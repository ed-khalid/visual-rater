package com.hawazin.visrater

import org.slf4j.LoggerFactory
import org.springframework.boot.web.client.RestTemplateCustomizer
import org.springframework.context.annotation.Bean
import org.springframework.http.HttpRequest
import org.springframework.http.client.ClientHttpRequestExecution
import org.springframework.http.client.ClientHttpRequestInterceptor
import org.springframework.http.client.ClientHttpResponse
import org.springframework.web.client.RestTemplate



class CustomRestTemplateCustomizer : RestTemplateCustomizer {
    override fun customize(restTemplate: RestTemplate?) {
        restTemplate?.interceptors?.add(CustomClientHttpRequestInterceptor())
    }
}

class CustomClientHttpRequestInterceptor: ClientHttpRequestInterceptor  {
    private var logger  = LoggerFactory.getLogger(javaClass)

    override fun intercept(
        request: HttpRequest,
        body: ByteArray,
        execution: ClientHttpRequestExecution
    ): ClientHttpResponse {
        log(request)
        return execution.execute(request,body)
    }
    private fun log(request:HttpRequest) {
        logger.info("Headers: {}", request.headers)
        logger.info("Request Method: {}", request.method)
        logger.info("Request URI: {}", request.uri)
    }

}