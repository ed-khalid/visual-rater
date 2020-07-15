import org.jetbrains.kotlin.gradle.tasks.KotlinCompile

plugins {
    id("org.springframework.boot") version "2.3.1.RELEASE"
    id("io.spring.dependency-management") version "1.0.9.RELEASE"
    kotlin("jvm") version "1.3.72"
    kotlin("plugin.spring") version "1.3.72"
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
    implementation("com.graphql-java-kickstart:graphql-spring-boot-starter:7.0.1")
    // to embed Altair tool
    runtimeOnly ("com.graphql-java-kickstart:altair-spring-boot-starter:7.0.1")
    // to embed GraphiQL tool
    runtimeOnly ("com.graphql-java-kickstart:graphiql-spring-boot-starter:7.0.1")
    // to embed Voyager tool
    runtimeOnly ("com.graphql-java-kickstart:voyager-spring-boot-starter:7.0.1")
    // testing facilities
    testImplementation("com.graphql-java-kickstart:graphql-spring-boot-starter-test:7.0.1")
    implementation("org.springframework.boot:spring-boot-starter-web")
    implementation("org.jetbrains.kotlin:kotlin-reflect")
    implementation("org.jetbrains.kotlin:kotlin-stdlib-jdk8")
    compileOnly("org.projectlombok:lombok")
    annotationProcessor("org.springframework.boot:spring-boot-configuration-processor")
    developmentOnly("org.springframework.boot:spring-boot-devtools")
    annotationProcessor("org.projectlombok:lombok")
    testImplementation("org.springframework.boot:spring-boot-starter-test") {
        exclude(group = "org.junit.vintage", module = "junit-vintage-engine")
    }
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
