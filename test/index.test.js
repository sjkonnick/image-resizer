const request = require('supertest');
require('dotenv').config()
const host = process.env.HOST;
const port = process.env.PORT;
const req = request(`${host}:${port}`);

describe('GET /resizer/{imageURL}', function() {
    it('receives a JPEG image and returns a resized JPEG image', function(done) {
      const jpegURL = 'https://upload.wikimedia.org/wikipedia/commons/b/b2/JPEG_compression_Example.jpg';
      const height = '100';
      const width = '100';

      req
        .get(`/resizer/${jpegURL}?width=${width}&height=${height}`)
        .set('Accept', 'image/jpeg')
        .expect('Content-Type', 'image/jpeg')
        .expect(200)
        .end(function(err) {
            if (err) return done(err);
            return done();
        });
    });

    it('receives a PNG image and returns a resized PNG image', function(done) {
        const pngURL = 'https://upload.wikimedia.org/wikipedia/commons/7/70/Example.png';
        const height = '100';
        const width = '100';
  
        req
          .get(`/resizer/${pngURL}?width=${width}&height=${height}`)
          .set('Accept', 'image/png')
          .expect('Content-Type', 'image/png')
          .expect(200)
          .end(function(err) {
              if (err) return done(err);
              return done();
          });
    });

    it('receives a GIF image and returns a resized GIF image', function(done) {
        const gifURL = 'https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExenltaGkxMWR6Z3lqZnc5cGF1Ymc1NjVqbXd2NzV6ZWpsNWx5ZjIyaiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/iPg2OZbNXc7uM/giphy.gif';
        const height = '100';
        const width = '100';
  
        req
          .get(`/resizer/${gifURL}?width=${width}&height=${height}`)
          .set('Accept', 'image/gif')
          .expect('Content-Type', 'image/gif')
          .expect(200)
          .end(function(err) {
              if (err) return done(err);
              return done();
          });
    });

    it('receives a WebP image and returns a resized WebP image', function(done) {
        const webpURL = 'https://res.cloudinary.com/demo/image/upload/w_300/sample.webp';
        const height = '100';
        const width = '100';
  
        req
          .get(`/resizer/${webpURL}?width=${width}&height=${height}`)
          .set('Accept', 'image/webp')
          .expect('Content-Type', 'image/webp')
          .expect(200)
          .end(function(err) {
              if (err) return done(err);
              return done();
          });
    });

    it('receives a bad url and returns a 400', function(done) {
        req
          .get(`/resizer/madeupurlvsfgerwgqegqerg242413`)
          .expect(400)
          .end(function(err) {
              if (err) return done(err);
              return done();
          });
    });

    it('receives a valid url that is not an image URL and returns a 400', function(done) {
        req
          .get(`/resizer/http://example.com`)
          .expect(400)
          .end(function(err) {
              if (err) return done(err);
              return done();
          });
    });

    it('receives a valid image URL that links to an unsupported image format and returns a 415', function(done) {
        req
          .get(`/resizer/https://upload.wikimedia.org/wikipedia/commons/6/6a/External_link_font_awesome.svg`)
          .expect(415)
          .end(function(err) {
              if (err) return done(err);
              return done();
          });
    });

    it('reduces the size of the image by specifying a lower width and height than the original image', function(done) {
        const jpegURL = 'https://upload.wikimedia.org/wikipedia/commons/b/b2/JPEG_compression_Example.jpg';
        const height = '100';
        const width = '100';
        let originalImageSize;

        req
          .get(`/resizer/${jpegURL}`)
          .set('Accept', 'image/jpeg')
          .expect('Content-Type', 'image/jpeg')
          .expect(200)
          .end(function(err, res) {
              originalImageSize = res.headers['content-length']
              
              req
                .get(`/resizer/${jpegURL}?width=${width}&height=${height}`)
                .set('Accept', 'image/jpeg')
                .expect('Content-Type', 'image/jpeg')
                .expect(200)
                .expect(function(response) {
                    response.headers['content-length'] < originalImageSize;
                })
                .end(function(e) {
                    if (e) return done(e);
                    return done();
                });
          });
      });
  });
  