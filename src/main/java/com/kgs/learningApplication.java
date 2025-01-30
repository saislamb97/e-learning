package com.learning;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class learningApplication {
    private static final Logger logger = LoggerFactory.getLogger(learningApplication.class);

    public static void main(String[] args) {
        SpringApplication.run(learningApplication.class, args);
        logger.debug("Debug logging is working!");
        logger.info("Info logging is working!");
    }
}
