package com.agentic.agentic_backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import io.github.cdimascio.dotenv.Dotenv;

@SpringBootApplication
public class AgenticBackendApplication {

	public static void main(String[] args) {
		// Load .env from spring_backend directory
		Dotenv dotenv = Dotenv.configure()
				.directory(".") // current directory is spring_backend
				.ignoreIfMissing()
				.load();
		SpringApplication.run(AgenticBackendApplication.class, args);
	}

}
