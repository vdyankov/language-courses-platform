import { Request, Response } from 'express';
import { CrudService, DashboardService } from '../services/platform.service';

interface IdParams {
    id: string;
}

export class CrudController<T, C> {
    constructor(
        private service: CrudService<T, C>,
        private resourceName: string
    ) {}

    getAll = async (_req: Request, res: Response): Promise<void> => {
        try {
            const data = await this.service.getAll();
            res.json({ message: `${this.resourceName} found`, data });
        } catch (error) {
            this.fail(res, error);
        }
    };

    getById = async (req: Request<IdParams>, res: Response): Promise<void> => {
        try {
            const item = await this.service.getById(this.parseId(req.params.id));
            if (!item) {
                res.status(404).json({ message: `${this.resourceName} not found` });
                return;
            }
            res.json({ message: `${this.resourceName} found`, data: item });
        } catch (error) {
            this.fail(res, error);
        }
    };

    create = async (req: Request, res: Response): Promise<void> => {
        try {
            const item = await this.service.create(req.body as C);
            res.status(201).json({ message: `${this.resourceName} created`, data: item });
        } catch (error) {
            this.fail(res, error);
        }
    };

    update = async (req: Request<IdParams>, res: Response): Promise<void> => {
        try {
            const item = await this.service.update(this.parseId(req.params.id), req.body as Partial<C>);
            if (!item) {
                res.status(404).json({ message: `${this.resourceName} not found` });
                return;
            }
            res.json({ message: `${this.resourceName} updated`, data: item });
        } catch (error) {
            this.fail(res, error);
        }
    };

    delete = async (req: Request<IdParams>, res: Response): Promise<void> => {
        try {
            const deleted = await this.service.delete(this.parseId(req.params.id));
            if (!deleted) {
                res.status(404).json({ message: `${this.resourceName} not found` });
                return;
            }
            res.json({ message: `${this.resourceName} deleted` });
        } catch (error) {
            this.fail(res, error);
        }
    };

    private parseId(value: string): number {
        const id = Number(value);
        if (!Number.isInteger(id) || id <= 0) {
            throw new Error('Invalid id');
        }
        return id;
    }

    private fail(res: Response, error: unknown): void {
        const message = error instanceof Error && error.message ? error.message : 'Unexpected error';
        res.status(400).json({ message: 'Request failed', error: message });
    }
}

export class DashboardController {
    constructor(private dashboardService: DashboardService) {}

    getStats = async (_req: Request, res: Response): Promise<void> => {
        try {
            const stats = await this.dashboardService.getStats();
            res.json({ message: 'Dashboard loaded', data: stats });
        } catch (error) {
            const message = error instanceof Error && error.message ? error.message : 'Unexpected error';
            res.status(400).json({ message: 'Dashboard failed', error: message });
        }
    };
}
