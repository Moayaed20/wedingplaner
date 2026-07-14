import { SelectedCateringDto } from './selected-catering.dto';
export declare class CreateBookingDto {
    hall_id: string;
    event_date: string;
    guest_count: number;
    customer_id?: string;
    selected_caterings?: SelectedCateringDto[];
    selected_decoration_ids?: string[];
    selected_car_id?: string | null;
    selected_music_ids?: string[];
}
