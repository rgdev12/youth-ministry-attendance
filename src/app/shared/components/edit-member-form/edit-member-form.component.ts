import { Component, EventEmitter, inject, Input, Output, OnInit } from '@angular/core';
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

@Component({
  selector: 'app-edit-member-form',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, ReactiveFormsModule, InputTextModule, Select, SelectButton],
  templateUrl: './edit-member-form.component.html',
  styleUrl: './edit-member-form.component.scss'
})
export class EditMemberFormComponent implements OnInit {
  @Input({ required: true }) member!: Member;
  @Output() saved = new EventEmitter<Member>();
  @Output() cancelled = new EventEmitter<void>();

  private groupService = inject(GroupService);
  private memberService = inject(MemberService);

  readonly LoaderIcon = Loader2;

  genderOptions = [
    { label: 'Masculino', value: 'M' },
    { label: 'Femenino', value: 'F' }
  ];

  readonly groups = this.groupService.groups;
  readonly isGroupsLoading = this.groupService.loading;
  
  isSaving = false;
  error = '';

  memberForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.memberForm = this.fb.group({
      name: ['', Validators.required],
      gender: ['M', Validators.required],
      groupId: [1, Validators.required]
    });
  }

  ngOnInit(): void {
    if (this.member) {
      this.memberForm.patchValue({
        name: this.member.name,
        gender: this.member.gender,
        groupId: this.member.group_id
      });
    }
  }

  async onSubmit(): Promise<void> {
    if (this.memberForm.invalid || !this.member.id) {
      this.error = 'Por favor completa todos los campos';
      return;
    }

    this.isSaving = true;
    this.error = '';

    try {
      const updatedMember = await this.memberService.updateMember(this.member.id, {
        name: this.memberForm.value.name.trim(),
        gender: this.memberForm.value.gender,
        group_id: this.memberForm.value.groupId
      });
      this.saved.emit(updatedMember);
    } catch (err) {
      this.error = 'Error al actualizar el miembro';
      console.error(err);
    } finally {
      this.isSaving = false;
    }
  }

  onCancel(): void {
    this.cancelled.emit();
  }
}
