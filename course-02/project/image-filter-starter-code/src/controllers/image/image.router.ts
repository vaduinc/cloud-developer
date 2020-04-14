import { Router, Request, Response } from 'express';
import { filterImageFromURL, deleteLocalFiles } from '../../util/util';

const router: Router = Router();

/**
 * Get the image URL, process it and return result.
 */
router.get('/', async (req: Request, res: Response) => {
    let { image_url } = req.query;

    try{
        let filteredImage : string;

        if (!image_url) {
            return res.status(400).send({ image_url: false, message: 'image_url is required' });
        }
        
        await filterImageFromURL(image_url).
            then( (path: string) => {
                filteredImage = path;
            });
        
        res.status(200).sendFile(filteredImage, function(){
            deleteLocalFiles([filteredImage]);
        });

    }catch(e){
        return res.status(500).send({ image_url: false, message: 'something went wrong processing the image. ' + e });
    };
    
});

export const ImageRouter: Router = router;