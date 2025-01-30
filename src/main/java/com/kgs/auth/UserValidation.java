package com.learning.auth;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class UserValidation extends RuntimeException {

    public UserValidation(String message) {
        super(message);
    }

    public static class EmailAlreadyExists extends UserValidation {
        public EmailAlreadyExists(String emailIsAlreadyTaken) {
            super(emailIsAlreadyTaken);
        }
    }

    public static class UsernameAlreadyExists extends UserValidation {
        public UsernameAlreadyExists(String usernameIsAlreadyTaken) {
            super(usernameIsAlreadyTaken);
        }
    }

    public static class InvalidEmailFormat extends UserValidation {
        public InvalidEmailFormat(String invalidEmailFormat) {
            super(invalidEmailFormat);
        }
    }

    public static class InvalidPasswordFormat extends UserValidation {
        public InvalidPasswordFormat(String invalidPasswordFormat) {
            super(invalidPasswordFormat);
        }
    }

    // Method to validate email format
    public static boolean isValidEmail(String email) {
        email = email.replaceAll("^\"|\"$", ""); // This removes the double quotes from the start and end of the string

        String emailRegex = "^[a-zA-Z0-9_+&*-]+(?:\\.[a-zA-Z0-9_+&*-]+)*@(?:[a-zA-Z0-9-]+\\.)+[a-zA-Z]{2,7}$";
        Pattern pattern = Pattern.compile(emailRegex);
        Matcher matcher = pattern.matcher(email);

        return !matcher.matches();
    }

    // Method to validate password format
    public static boolean isValidPassword(String password) {
        // - At least 8 characters long
        // - Contains at least one uppercase letter
        // - Contains at least one lowercase letter
        // - Contains at least one digit
        String passwordRegex = "^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z]).{8,}$";
        Pattern pattern = Pattern.compile(passwordRegex);
        Matcher matcher = pattern.matcher(password);

        return !matcher.matches();
    }
}
