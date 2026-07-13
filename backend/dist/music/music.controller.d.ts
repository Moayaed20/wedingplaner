import { MusicService } from './music.service';
import { CreateMusicDto } from './dto/create-music.dto';
export declare class MusicController {
    private readonly musicService;
    constructor(musicService: MusicService);
    findByHall(hallId: string): Promise<import("./schemas/music.schema").Music[]>;
    create(hallId: string, dto: CreateMusicDto): Promise<import("./schemas/music.schema").Music>;
    update(id: string, dto: Partial<CreateMusicDto>): Promise<import("./schemas/music.schema").Music>;
    remove(id: string): Promise<{
        deleted: boolean;
    }>;
}
