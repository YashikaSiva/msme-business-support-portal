import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Scheme } from '../../models/scheme';

@Component({
  selector: 'app-scheme-card',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './scheme-card.html',
  styleUrl: './scheme-card.css',
})
export class SchemeCard {
  @Input() scheme!: Scheme;
  @Input() matchTag?: string; // e.g. "Matches your profile" - optional
}