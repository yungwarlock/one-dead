package pubsub

import (
	"fmt"
	"sync"
)

type PubSub struct {
	subscribers map[string][]chan any
	mu          sync.RWMutex
}

func NewPubSub() *PubSub {
	return &PubSub{
		subscribers: make(map[string][]chan any),
	}
}

// Subscribe adds a new subscriber for a topic
func (ps *PubSub) Subscribe(topic string) chan any {
	ps.mu.Lock()
	defer ps.mu.Unlock()

	fmt.Println("Subscribing to topic", topic)
	ch := make(chan any, 1)
	ps.subscribers[topic] = append(ps.subscribers[topic], ch)
	return ch
}

// Publish sends a message to all subscribers of a topic
func (ps *PubSub) Publish(topic string, msg any) {
	ps.mu.RLock()
	defer ps.mu.RUnlock()

	// Get subscribers for this topic
	subscribers, exists := ps.subscribers[topic]
	if !exists {
		return
	}

	// Send message to each subscriber
	for _, ch := range subscribers {
		// Non-blocking send
		select {
		case ch <- msg:
		default:
			// Skip if channel is full
		}
	}
}
