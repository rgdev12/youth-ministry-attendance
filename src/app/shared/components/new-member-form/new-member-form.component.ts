import { Component, EventEmitter, inject, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Loader2 } from 'lucide-angular';
import { GroupService } from '@core/services/group.service';
import { MemberService } from '@core/services/member.service';
import { Group } from '@core/models/group.model';
import { Member } from '@core/models/member.model';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-new-member-form',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, ReactiveFormsModule],
  templateUrl: './new-member-form.component.html',
  styleUrl: './new-member-form.component.scss'
})
export class NewMemberFormComponent implements OnInit {
  @Output() saved = new EventEmitter<Member>();
  @Output() cancelled = new EventEmitter<void>();

  private groupService = inject(GroupService);
  private memberService = inject(MemberService);

  // Icons
  readonly LoaderIcon = Loader2;

  // Form state
  name = '';
  gender: 'M' | 'F' = 'M';
  groupId = '';

  // Data
  groups: Group[] = [];
  
  // UI state
  isLoading = false;
  isSaving = false;
  error = '';

  // Reactive form
  memberForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.memberForm = this.fb.group({
      name: ['', Validators.required],
      gender: ['M', Validators.required],
      groupId: [1, Validators.required]
    });
  }

  async ngOnInit(): Promise<void> {
    await this.loadGroups();
  }

  async loadGroups(): Promise<void> {
    this.isLoading = true;
    try {
      this.groups = await this.groupService.getGroups();
      if (this.groups.length > 0) {
        this.groupId = this.groups[0].id;
      }
    } catch (err) {
      this.error = 'Error al cargar los grupos';
      console.error(err);
    } finally {
      this.isLoading = false;
    }
  }

  selectGender(gender: 'M' | 'F'): void {
    this.gender = gender;
  }

  async onSubmit(): Promise<void> {
    if (this.memberForm.invalid) {
      this.error = 'Por favor completa todos los campos';
      return;
    }

    this.isSaving = true;
    this.error = '';

    try {
      const newMember = await this.memberService.createMember({
        name: this.memberForm.value.name.trim(),
        gender: this.memberForm.value.gender,
        group_id: this.memberForm.value.groupId
      });
      this.saved.emit(newMember);
      this.resetForm();
    } catch (err) {
      this.error = 'Error al guardar el miembro';
      console.error(err);
    } finally {
      this.isSaving = false;
    }
  }

  onCancel(): void {
    this.resetForm();
    this.cancelled.emit();
  }

  private resetForm(): void {
    this.memberForm.reset();
    this.error = '';
  }
}
