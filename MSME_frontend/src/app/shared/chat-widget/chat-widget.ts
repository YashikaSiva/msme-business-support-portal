import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface ChatMessage {
  from: 'user' | 'bot';
  text: string;
}

@Component({
  selector: 'app-chat-widget',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat-widget.html',
  styleUrl: './chat-widget.css',
})
export class ChatWidget {
  isOpen = false;
  draft = '';

  messages: ChatMessage[] = [
    { from: 'bot', text: 'Hi! Ask me about eligibility, documents, or how to apply for a scheme.' },
  ];

  quickReplies = [
    'What documents do I need for PMEGP?',
    'Am I eligible for NEEDS?',
    'How long does approval take?',
  ];

  toggle(): void {
    this.isOpen = !this.isOpen;
  }

  send(text?: string): void {
    const message = (text ?? this.draft).trim();
    if (!message) return;
    this.messages.push({ from: 'user', text: message });
    this.draft = '';
    // Placeholder response — real answers wired up later
    setTimeout(() => {
      this.messages.push({
        from: 'bot',
        text: "This is a frontend preview — I'll be connected to real scheme data soon.",
      });
    }, 400);
  }
}