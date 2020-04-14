import { Router, Request, Response } from 'express';
import { FeedItem } from '../models/FeedItem';
import { requireAuth } from '../../users/routes/auth.router';
import * as AWS from '../../../../aws';
import { config } from '../../../../config/config';

const router: Router = Router();
const axios = require('axios').default;

// Get all feed items
router.get('/', async (req: Request, res: Response) => {
    const items = await FeedItem.findAndCountAll({order: [['id', 'DESC']]});
    items.rows.map((item) => {
            if(item.url) {
                item.url = AWS.getGetSignedUrl(item.url);
            }
    });
    res.send(items);
});

// Get one feed item by ID
router.get('/:id', async (req: Request, res: Response) => {
    let { id } = req.params;
    try{
        const item = await FeedItem.findByPk(id);
        if (!item){
            return res.status(404).send({ message: 'No record with id ' + id });
        }
        res.send(item);
    }catch(error){
        return res.status(500).send({ message: 'Something when wrong when searching for id ' + id });
    }
});

/**
 * Process the specific URL image.
 * Forward request to Image Process server and return the
 * response to the caller.
 * It does NOT required authentication.
 */
router.post('/process-image/transform', async (req: Request, res: Response) => {
    let { image_url } = req.body;
    axios({
        method: 'get',
        url: config.image_api.host + 'filteredimage?image_url=' + image_url,
        responseType: 'stream'
      })
        .then(function(response: any) {
          response.data.pipe(res)
      });

});

// update a specific resource
router.patch('/:id', 
    requireAuth, 
    async (req: Request, res: Response) => {
        //@TODO try it yourself
        // res.send(500).send("not implemented")
        let { id } = req.params;
        const caption = req.body.caption;
        const fileName = req.body.url;
    
        // check Caption is valid
        if (!caption) {
            return res.status(400).send({ message: 'Caption is required or malformed' });
        }
    
        // check Filename is valid
        if (!fileName) {
            return res.status(400).send({ message: 'File url is required' });
        }

        try {
            const result = await FeedItem.update(
              { caption: caption, url: fileName },
              { where: { id: id } }
            )
            res.send(result);
          } catch (er) {
            return res.status(500).send({ message: 'Something when wrong when updating record id ' + id });
          }
});


// Get a signed url to put a new item in the bucket
router.get('/signed-url/:fileName', 
    requireAuth, 
    async (req: Request, res: Response) => {
    let { fileName } = req.params;
    const url = AWS.getPutSignedUrl(fileName);
    res.status(201).send({url: url});
});

// Post meta data and the filename after a file is uploaded 
// NOTE the file name is they key name in the s3 bucket.
// body : {caption: string, fileName: string};
router.post('/', 
    requireAuth, 
    async (req: Request, res: Response) => {
    const caption = req.body.caption;
    const fileName = req.body.url;

    // check Caption is valid
    if (!caption) {
        return res.status(400).send({ message: 'Caption is required or malformed' });
    }

    // check Filename is valid
    if (!fileName) {
        return res.status(400).send({ message: 'File url is required' });
    }

    const item = await new FeedItem({
            caption: caption,
            url: fileName
    });

    const saved_item = await item.save();

    saved_item.url = AWS.getGetSignedUrl(saved_item.url);
    res.status(201).send(saved_item);
});

export const FeedRouter: Router = router;