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
        try {
            // Load .env file from the project root (backend directory)
            Dotenv dotenv = Dotenv.configure()
                    .directory("./") // Current directory (backend folder)
                    .ignoreIfMissing() // Don't fail if .env is missing (e.g., in production)
                    .load();

            ConfigurableEnvironment environment = applicationContext.getEnvironment();
            Map<String, Object> envMap = new HashMap<>();

            // Add all environment variables from .env to Spring environment
            dotenv.entries().forEach(entry -> {
                envMap.put(entry.getKey(), entry.getValue());
                if (!entry.getKey().contains("PASSWORD") && !entry.getKey().contains("SECRET")) {
                    System.out.println("Loaded env variable: " + entry.getKey());
                }
            });

            // Add the properties to Spring's environment with high priority
            environment.getPropertySources()
                    .addFirst(new MapPropertySource("dotenvProperties", envMap));

            System.out.println("✓ Environment configuration loaded successfully");

        } catch (Exception e) {
            System.err.println("⚠ Warning: Could not load .env file - " + e.getMessage());
            System.err.println("Attempting to use system environment variables...");
        }
    }
}