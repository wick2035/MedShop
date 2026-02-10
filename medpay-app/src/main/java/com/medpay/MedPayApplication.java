package com.medpay;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication(scanBasePackages = "com.medpay")
@EnableScheduling
@EnableAsync
public class MedPayApplication {

    public static void main(String[] args) {
        SpringApplication.run(MedPayApplication.class, args);
    }
}
