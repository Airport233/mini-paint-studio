package com.minipaint.model.dto;

import com.minipaint.model.dto.request.RegisterRequest;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.*;

class RequestValidationTest {

    private final Validator validator = Validation.buildDefaultValidatorFactory().getValidator();

    @Test
    void shouldAcceptValidRegisterRequest() {
        var req = new RegisterRequest("user@example.com", "password1");
        assertThat(validator.validate(req)).isEmpty();
    }

    @Test
    void shouldRejectBlankEmail() {
        var req = new RegisterRequest("", "password1");
        assertThat(validator.validate(req)).isNotEmpty();
    }

    @Test
    void shouldRejectInvalidEmailFormat() {
        var req = new RegisterRequest("not-an-email", "password1");
        assertThat(validator.validate(req)).isNotEmpty();
    }

    @Test
    void shouldRejectShortPassword() {
        var req = new RegisterRequest("user@example.com", "1234567");
        assertThat(validator.validate(req)).isNotEmpty();
    }

    @Test
    void shouldAcceptMinLengthPassword() {
        var req = new RegisterRequest("user@example.com", "12345678");
        assertThat(validator.validate(req)).isEmpty();
    }
}
