const GeneratedNFTs = ({ generatedNFTs, onDownloadNFT, onDownloadMetadata }) => {
  return (
    <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-xl p-6 border border-white border-opacity-20">
      <h2 className="text-2xl font-bold text-white mb-4">
        Generated NFTs ({generatedNFTs.length})
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {generatedNFTs.map((nft) => (
          <div key={nft.id} className="bg-white bg-opacity-10 rounded-lg overflow-hidden">
            <img
              src={nft.image}
              alt={`NFT ${nft.id}`}
              className="w-full aspect-square object-cover"
            />
            <div className="p-3">
              <p className="text-white font-semibold mb-2">NFT #{nft.id}</p>
              <div className="flex gap-2">
                <button
                  onClick={() => onDownloadNFT(nft)}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white text-sm py-2 rounded transition-all"
                >
                  Image
                </button>
                <button
                  onClick={() => onDownloadMetadata(nft)}
                  className="flex-1 bg-purple-500 hover:bg-purple-600 text-white text-sm py-2 rounded transition-all"
                >
                  JSON
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GeneratedNFTs;
