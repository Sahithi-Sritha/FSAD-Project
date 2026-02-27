package com.nutrition.dietbalancetracker.repository;

import com.nutrition.dietbalancetracker.model.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

/**
 * CHAT MESSAGE REPOSITORY
 * =======================
 * Database operations for chat history.
 */
@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

    /** Get all messages for a user, ordered by creation time */
    List<ChatMessage> findByUserIdOrderByCreatedAtAsc(Long userId);

    /** Delete all messages for a user */
    void deleteByUserId(Long userId);
}
