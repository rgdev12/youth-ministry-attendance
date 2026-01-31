import { Component } from '@angular/core';
import { Header } from '@shared/components/header/header.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [Header],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss',
})
export class MainLayout {}
