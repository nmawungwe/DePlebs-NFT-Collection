export default function handler(req, res) {
    // get the tokenId from the query params 
    const tokenId = req.query.tokenId;
    
    // All images are uploaded on google storage, we can extract the images from google directly  
    const image_url = "https://storage.googleapis.com/nftcollection/4787035/DogDash/";

  
    /**
     *The api is sending back metadata for a DePleb 
     *To make our collection compatible with Opensea we need to follow the Metadata standards
     *when sending back the response from the api   
     * for info  https://docs.opensea.io/docs/metadata-standards
     */
    res.status(200).json({
        name: "DePleb #" + tokenId,
        description: "An NFT collection of 500 degen pleb dogs on the Ethereum Blockchain!",
        image: image_url + tokenId + ".png",
    })

}