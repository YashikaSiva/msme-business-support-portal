import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  categories = [
    { name: 'Manufacturing', icon: '🏭', description: 'Capital subsidies & technology upgrade support' },
    { name: 'Women Entrepreneurs', icon: '👩‍💼', description: 'Special subsidies and relaxed eligibility norms' },
    { name: 'First-Generation Entrepreneurs', icon: '🌱', description: 'NEEDS scheme support for ages 21–45' },
    { name: 'Technology Upgrade', icon: '⚙️', description: 'CLCSS and equipment modernization support' },
    { name: 'Export Facilitation', icon: '🚢', description: 'Support for MSMEs entering export markets' },
    { name: 'Agro-based MSMEs', icon: '🌾', description: 'Food processing & agro-industry schemes' },
  ];

  trustBadges = ['PMEGP', 'MUDRA', 'CGTMSE', 'Stand-Up India', 'NEEDS (TN)', 'TNCGS (TN)'];
}