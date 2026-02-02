import { Component, inject, input, numberAttribute } from '@angular/core';
import { MainLayout } from '@shared/layouts/main-layout/main-layout.component';
import { MemberService } from '@core/services/member.service';
import { DatePickerModule } from 'primeng/datepicker';
import { FormsModule } from '@angular/forms';
import { computed, effect } from '@angular/core';
import { GroupService } from '@core/services/group.service';


@Component({
  selector: 'app-attendances',
  imports: [MainLayout, DatePickerModule, FormsModule],
  templateUrl: './attendances.component.html',
  styleUrl: './attendances.component.scss',
})
export default class Attendances {
  private memberService = inject(MemberService);
  private groupService = inject(GroupService);

  groupId = input.required<number, string | number>({ 
    alias: 'group',
    transform: numberAttribute 
  });
  selectedDate: Date = new Date();

  group = computed(() => {
    return this.groupService.groups().find(g => g.id === this.groupId());
  });

  constructor() {
    effect(() => {
      const id = this.groupId();
      this.memberService.getMembersByGroup(id).then(members => {
        console.log('Miembros cargados:', members);
      });
    });
  }
}
