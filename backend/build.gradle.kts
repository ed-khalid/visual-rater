import org.jetbrains.kotlin.gradle.tasks.KotlinCompile


plugins {
    id("org.springframework.boot") version "2.4.2"
    id("io.spring.dependency-management") version "1.0.11.RELEASE"
    kotlin("jvm") version "1.4.21"
    kotlin("plugin.spring") version "1.4.21"
    kotlin("plugin.allopen") version "1.4.21"
    kotlin("plugin.noarg") version "1.4.21"
    kotlin("plugin.jpa") version "1.4.21"
}

group = "com.hawazin"
version = "0.0.1-SNAPSHOT"
java.sourceCompatibility = JavaVersion.VERSION_11

configurations {
    compileOnly {
        extendsFrom(configurations.annotationProcessor.get())
    }
}

repositories {
    jcenter()
    mavenCentral()
}

dependencies {

    // kotlin
    implementation("org.jetbrains.kotlin:kotlin-reflect")
    implementation("org.jetbrains.kotlin:kotlin-stdlib-jdk8")

    // spring
    implementation("org.springframework.boot:spring-boot-starter-web")
    implementation("org.springframework.boot:spring-boot-starter-data-jpa")

    // graphql
    implementation("com.graphql-java-kickstart:graphql-spring-boot-starter:7.0.1")
    // to embed GraphiQL tool
    runtimeOnly ("com.graphql-java-kickstart:graphiql-spring-boot-starter:7.0.1")

    // rx
    implementation("io.reactivex.rxjava3:rxkotlin:3.0.1")

    // db
    runtimeOnly("org.postgresql:postgresql")

    // jackson
    implementation("com.fasterxml.jackson.module:jackson-module-kotlin:2.11.+")

    // test
    testRuntimeOnly("com.h2database:h2")
    testImplementation("org.springframework.boot:spring-boot-starter-test") {
        exclude(group = "org.junit.vintage", module = "junit-vintage-engine")
    }
    testImplementation("com.graphql-java-kickstart:graphql-spring-boot-starter-test:7.0.1")

    // helpers
    compileOnly("org.projectlombok:lombok")
    annotationProcessor("org.springframework.boot:spring-boot-configuration-processor")
    developmentOnly("org.springframework.boot:spring-boot-devtools")
    annotationProcessor("org.projectlombok:lombok")

}

tasks.withType<Test> {
    useJUnitPlatform()
}

tasks.withType<KotlinCompile> {
    kotlinOptions {
        freeCompilerArgs = listOf("-Xjsr305=strict")
        jvmTarget = "11"
    }
}

allOpen {
    annotation("javax.persistence.Entity")
    annotation("javax.persistence.Embeddable")
    annotation("javax.persistence.MapperSuperclass")
}
