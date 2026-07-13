import { Model } from 'mongoose';
import { Music } from './schemas/music.schema';
import { CreateMusicDto } from './dto/create-music.dto';
export declare class MusicService {
    private musicModel;
    constructor(musicModel: Model<Music>);
    findByHall(hallId: string): Promise<Music[]>;
    findOne(id: string): Promise<Music>;
    create(hallId: string, dto: CreateMusicDto): Promise<Music>;
    update(id: string, dto: Partial<CreateMusicDto>): Promise<Music>;
    remove(id: string): Promise<{
        deleted: boolean;
    }>;
}
