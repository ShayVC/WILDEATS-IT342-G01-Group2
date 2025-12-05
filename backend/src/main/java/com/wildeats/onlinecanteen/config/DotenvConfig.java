package com.wildeats.onlinecanteen.config;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.context.ApplicationContextInitializer;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;

import java.util.HashMap;
import java.util.Map;

public class DotenvConfig implements ApplicationContextInitializer<ConfigurableApplicationContext> {

    @Override
    public void initialize(ConfigurableApplicationContext applicationContext) {
        // Load .env file from the project root (backend directory)
        Dotenv dotenv = Dotenv.configure()
                .directory("./") // Current directory (backend folder)
                .ignoreIfMissing()
                .load();

        ConfigurableEnvironment environment = applicationContext.getEnvironment();
        Map<String, Object> envMap = new HashMap<>();

        // Add all environment variables from .env to Spring environment
        dotenv.entries().forEach(entry -> {
            envMap.put(entry.getKey(), entry.getValue());
            System.out.println("Loaded env variable: " + entry.getKey() + "=" + entry.getValue());
        });

        // Add the properties to Spring's environment with high priority
        environment.getPropertySources()
                .addFirst(new MapPropertySource("dotenvProperties", envMap));

        System.out.println("DotenvConfig initialized successfully");
    }
}