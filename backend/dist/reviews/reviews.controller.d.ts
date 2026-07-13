import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
export declare class ReviewsController {
    private readonly reviewsService;
    constructor(reviewsService: ReviewsService);
    findByHall(hallId: string): Promise<import("./schemas/review.schema").Review[]>;
    create(dto: CreateReviewDto, userId: string): Promise<import("./schemas/review.schema").Review>;
    remove(id: string, user: any): Promise<{
        deleted: boolean;
        hallId?: string;
    }>;
}
