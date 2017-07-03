/* eslint no-restricted-syntax: 0 */
import path from 'path';
import { Application } from 'spectron';
import electronPath from 'electron';
import { OPEN_FILE_CHANNEL } from '../../app/types/channels';

jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;

const delay = time => new Promise(resolve => setTimeout(resolve, time));

describe('e2e', function testApp() {
  // Constructs url similar to file:///Users/john/popcorn-desktop-experimental/app/app.html#/${url}

  beforeAll(async () => {
    this.app = new Application({
      path: electronPath,
      args: [path.join(__dirname, '..', '..', 'app')]
    });
    return this.app.start();
  });

  afterAll(() => {
    if (this.app && this.app.isRunning()) {
      return this.app.stop();
    }
  });

  describe('main window', () => {
    it('should open window', async () => {
      const { client } = this.app;
      const title = await client.getTitle();
      const url = await client.getUrl();
      const route = await url.substring(url.lastIndexOf('/'));
      expect(title).toBe('Falcon');
      expect(route).toBe('/');
    });

    it('should navigate to HomePage', async () => {
      const { client } = this.app;
      await client.click('#connectButton');
      const url = await client.getUrl();
      const route = await url.substring(url.lastIndexOf('/'));
      expect(route).toBe('/home');
      expect(await client.isExisting('#OpenFileDiv')).toBe(true);
    });

    it('should open a demo and be viewing home', async () => {
      const { client, webContents } = this.app;
      const sqliteFilePath = path.join(
        __dirname,
        '..',
        '..',
        '/app',
        'demo.sqlite'
      );
      await webContents.send(OPEN_FILE_CHANNEL, sqliteFilePath);
      await delay(1000);
      expect(await client.isExisting('#HomeDiv')).toBe(true);
    });

    it('should be at table albums', async () => {
      const { client } = this.app;
      const breadcrumb = await client.getText('.ant-breadcrumb');
      expect(breadcrumb).toBe('SQLite/demo.sqlite/albums');
    });

    it('should be at table playlists after clicking playlists', async () => {
      const { client } = this.app;
      await client.click('.ant-menu-item:last-of-type');
      await delay(1000);
      const breadcrumb = await client.getText('.ant-breadcrumb');
      expect(breadcrumb).toBe('SQLite/demo.sqlite/tracks');
    });

    it('TrackId of 1st in table tracks row should be 1', async () => {
      const { client } = this.app;
      const id = await client.getText(
        '.rt-tr-group:first-child .rt-tr:first-child .rt-td:first-child'
      );
      expect(id).toBe('1');
    });

    it('Dbl-click above cell should yield an input with value 1', async () => {
      const { client } = this.app;
      await client.doubleClick(
        '.rt-tr-group:first-child .rt-tr:first-child .rt-td:first-child'
      );
      const inputValue = await client.getValue(
        '.rt-tr-group:first-child .rt-tr:first-child .rt-td:first-child input'
      );
      expect(inputValue).toBe('1');
    });

    it('Setting new input value then unfocusing should yield above cell with new content', async () => {
      const { client } = this.app;
      await client.setValue(
        '.rt-tr-group:first-child .rt-tr:first-child .rt-td:first-child input',
        'TESTING E2E'
      );
      await client.click(
        '.rt-tr-group:first-child .rt-tr:first-child .rt-td:last-child'
      );
      const content = await client.getText(
        '.rt-tr-group:first-child .rt-tr:first-child .rt-td:first-child'
      );
      expect(content).toBe('TESTING E2E');
    });

    it('Removing input value then unfocusing should yield above cell with null', async () => {
      const { client } = this.app;
      await client.doubleClick(
        '.rt-tr-group:first-child .rt-tr:first-child .rt-td:first-child'
      );
      await client.clearElement(
        '.rt-tr-group:first-child .rt-tr:first-child .rt-td:first-child input'
      );
      await client.click(
        '.rt-tr-group:first-child .rt-tr:first-child .rt-td:last-child'
      );
      const content = await client.getText(
        '.rt-tr-group:first-child .rt-tr:first-child .rt-td:first-child'
      );
      expect(content).toBe('NULL');
    });
  });
});
