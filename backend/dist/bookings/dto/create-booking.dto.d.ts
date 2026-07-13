import { SelectedCateringDto } from './selected-catering.dto';
export declare class CreateBookingDto {
    hall_id: string;
    event_date: string;
    guest_count: number;
    selected_caterings?: SelectedCateringDto[];
    selected_decoration_id?: string;
    selected_car_id?: string;
    selected_music_id?: string;
}
