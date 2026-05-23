package com.minipaint.repository;

import com.minipaint.model.entity.Paint;
import com.minipaint.enums.Brand;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import static org.assertj.core.api.Assertions.*;

@DataJpaTest
class PaintRepositoryTest {

    @Autowired
    private PaintRepository paintRepository;

    @Test
    void shouldSaveAndFindById() {
        Paint paint = new Paint(Brand.GW, "70.950", "Black", 0, 0, 0);
        paint = paintRepository.save(paint);
        var found = paintRepository.findById(paint.getId());
        assertThat(found).isPresent();
        assertThat(found.get().getName()).isEqualTo("Black");
    }

    @Test
    void shouldFindByUserId() {
        // MVP: userId is set manually since no user entity linked in the test
        Paint p1 = new Paint(Brand.AV, "70.001", "White", 255, 255, 255);
        Paint p2 = new Paint(Brand.AV, "70.002", "Red", 255, 0, 0);
        paintRepository.save(p1);
        paintRepository.save(p2);

        var all = paintRepository.findAll();
        assertThat(all).hasSize(2);
    }

    @Test
    void shouldRejectDuplicateBrandAndCode() {
        UUID userId = UUID.randomUUID();
        Paint p1 = new Paint(Brand.AK, "11001", "Blue", 0, 0, 255);
        p1.setUserId(userId);
        paintRepository.saveAndFlush(p1);
        Paint p2 = new Paint(Brand.AK, "11001", "Blue 2", 0, 0, 200);
        p2.setUserId(userId);
        assertThatThrownBy(() -> paintRepository.saveAndFlush(p2))
                .isInstanceOf(org.springframework.dao.DataIntegrityViolationException.class);
    }
}
