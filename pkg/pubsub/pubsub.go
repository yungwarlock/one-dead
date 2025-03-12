package pubsub

import (
	"sync"
)

type PubSub[T any] struct {
	subscribers []chan T
	mu          sync.RWMutex
}

func NewPubSub[T any]() *PubSub[T] {
	return &PubSub[T]{
		subscribers: make([]chan T, 0),
	}
}

// Subscribe adds a new subscriber for a topic
func (ps *PubSub[T]) Subscribe() chan T {
	ps.mu.Lock()
	defer ps.mu.Unlock()

	ch := make(chan T, 1)
	ps.subscribers = append(ps.subscribers, ch)
	return ch
}

// Publish sends a message to all subscribers of a topic
func (ps *PubSub[T]) Publish(msg T) {
	ps.mu.RLock()
	defer ps.mu.RUnlock()

	// Send message to each subscriber
	for _, ch := range ps.subscribers {
		// Non-blocking send
		select {
		case ch <- msg:
		default:
			// Skip if channel is full
		}
	}
}

func (ps *PubSub[T]) Close(c chan T) {
	ps.mu.Lock()
	defer ps.mu.Unlock()

	for i, sub := range ps.subscribers {
		if sub == c {
			close(sub)
			ps.subscribers = append(ps.subscribers[:i], ps.subscribers[i+1:]...)
			return
		}
	}
}
