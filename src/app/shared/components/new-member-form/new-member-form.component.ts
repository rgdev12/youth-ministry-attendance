import { Component, EventEmitter, inject, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Loader2 } from 'lucide-angular';
import { GroupService } from '@core/services/group.service';
import { MemberService } from '@core/services/member.service';
import { Member } from '@core/models/member.model';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { SelectButton } from 'primeng/selectbutton';
import { DatePickerModule } from 'primeng/datepicker';

@Component({
  selector: 'app-new-member-form',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    LucideAngularModule, 
    ReactiveFormsModule, 
    InputTextModule, 
    Select, 
    SelectButton, 
    DatePickerModule
  ],
  templateUrl: './new-member-form.component.html',
  styleUrl: './new-member-form.component.scss'
})
export class NewMemberFormComponent {
  @Output() saved = new EventEmitter<Member>();
  @Output() cancelled = new EventEmitter<void>();

  private groupService = inject(GroupService);
  private memberService = inject(MemberService);

  // Icons
  readonly LoaderIcon = Loader2;

  // Gender options for SelectButton
  genderOptions = [
    { label: 'Masculino', value: 'M' },
    { label: 'Femenino', value: 'F' }
  ];

  // Groups from the service (cached globally)
  readonly groups = this.groupService.groups;
  readonly isGroupsLoading = this.groupService.loading;
  
  // UI state
  isSaving = false;
  error = '';

  // Reactive form
  memberForm: FormGroup;

  // Date picker max date (today)
  maxDate: Date = new Date();

  constructor(private fb: FormBuilder) {
    this.memberForm = this.fb.group({
      name: ['', Validators.required],
      gender: ['M', Validators.required],
      groupId: [1, Validators.required],
      birthdate: [null]
    });
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
        group_id: this.memberForm.value.groupId,
        birthdate: this.memberForm.value.birthdate
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
    this.memberForm.patchValue({
      gender: 'M',
      groupId: 1
    });
    this.error = '';
  }
}
