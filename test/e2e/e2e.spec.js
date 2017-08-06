/* eslint no-restricted-syntax: 0 */
import path from 'path';
import { expect as chaiExpect } from 'chai';
import { Application } from 'spectron';
import electronPath from 'electron';

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

  afterAll(() => (this.app && this.app.isRunning() ? this.app.stop() : true));

  describe('main window', () => {
    describe('should open the database and navigate correctly', () => {
      it('should open window', async () => {
        const { client } = this.app;
        const title = await client.getTitle();
        const url = await client.getUrl();
        const route = await url.substring(url.lastIndexOf('/'));
        expect(title).toBe('Falcon');
        expect(route).toBe('/');
      });

      it('should open temp.sqlite and navigate to HomePage', async () => {
        const { client } = this.app;
        const sqliteFilePath = path.join(__dirname, 'temp.sqlite');
        await client.setValue('input:nth-child(2)', sqliteFilePath);
        await client.click('#connectButton');
        await delay(500);
        const url = await client.getUrl();
        const route = await url.substring(url.lastIndexOf('/home'));
        const expectedRoute = `/home/${sqliteFilePath.replace(/\//g, '_')}`;
        await delay(300);
        expect(route).toBe(expectedRoute);
      });

      it('should be at table albums', async () => {
        const { client } = this.app;
        const breadcrumb = await client.getText('.ant-breadcrumb');
        chaiExpect(breadcrumb).to.be.oneOf([
          'SQLite/temp.sqlite/albums',
          'SQLite/C:\\projects\\falcon\\test\\e2e\\temp.sqlite/albums'
        ]);
      });

      it('should be at table employees after clicking employees', async () => {
        const { client } = this.app;
        await client.click('.ant-menu-item:nth-child(4)');
        await delay(1000);
        const breadcrumb = await client.getText('.ant-breadcrumb');
        chaiExpect(breadcrumb).to.be.oneOf([
          'SQLite/temp.sqlite/employees',
          'SQLite/C:\\projects\\falcon\\test\\e2e\\temp.sqlite/employees'
        ]);
      });

      it('should validate content of first row in employees', async () => {
        const { client } = this.app;
        const id = await client.getText(
          '.rt-tr-group:first-child .rt-tr:first-child .rt-td:first-child'
        );
        expect(id).toBe('1');
        const lastName = await client.getText(
          '.rt-tr-group:first-child .rt-tr:first-child .rt-td:nth-child(2)'
        );
        expect(lastName).toBe('Adams');
        const firstName = await client.getText(
          '.rt-tr-group:first-child .rt-tr:first-child .rt-td:nth-child(3)'
        );
        expect(firstName).toBe('Andrew');
      });
    });
  });

  describe('should perform delete, insert, and update operations', () => {
    describe('should update FirstName and LastName of first employee', () => {
      it('Dbl-clicking Adams cell should yield an <input> with content Adams', async () => {
        const { client } = this.app;
        await client.doubleClick(
          '.rt-tr-group:first-child .rt-tr:first-child .rt-td:nth-child(2)'
        );
        await delay(200);
        const inputValue = await client.getValue(
          '.rt-tr-group:first-child .rt-tr:first-child .rt-td:nth-child(2) input'
        );
        await delay(200);
        expect(inputValue).toBe('Adams');
      });

      it('Removing input value then unfocusing should yield above cell with null', async () => {
        const { client } = this.app;
        await client.clearElement(
          '.rt-tr-group:first-child .rt-tr:first-child .rt-td:nth-child(2) input'
        );
        await client.click(
          '.rt-tr-group:first-child .rt-tr:first-child .rt-td:last-child'
        );
        await delay(200);
        const content = await client.getText(
          '.rt-tr-group:first-child .rt-tr:first-child .rt-td:nth-child(2)'
        );
        expect(content).toBe('NULL');
      });

      it('Setting new input value then unfocusing should yield above cell with new content', async () => {
        const { client } = this.app;
        await client.doubleClick(
          '.rt-tr-group:first-child .rt-tr:first-child .rt-td:nth-child(2)'
        );
        await client.setValue(
          '.rt-tr-group:first-child .rt-tr:first-child .rt-td:nth-child(2) input',
          'TESTING E2E LAST NAME'
        );
        await client.click(
          '.rt-tr-group:first-child .rt-tr:first-child .rt-td:last-child'
        );
        const lastName = await client.getText(
          '.rt-tr-group:first-child .rt-tr:first-child .rt-td:nth-child(2)'
        );
        expect(lastName).toBe('TESTING E2E LAST NAME');
      });

      it('Saving updates then refreshing should show that the update persisted', async () => {
        const { client } = this.app;
        await delay(250);
        const lastName = await client.getText(
          '.rt-tr-group:first-child .rt-tr:first-child .rt-td:nth-child(2)'
        );
        expect(lastName).toBe('TESTING E2E LAST NAME');
      });
    });

    describe('should insert two row, then delete rows with EmployeeId 6 and 7', async () => {
      it('Should insert two rows', async () => {
        const { client } = this.app;
        await client.click('button=Insert Row');
        await client.click('button=Insert Row');

        await delay(100);
        await client
          .doubleClick(
            '.rt-tr-group:nth-child(9) .rt-tr:first-child .rt-td:nth-child(1)'
          )
          .setValue(
            '.rt-tr-group:nth-child(9) .rt-tr:first-child .rt-td:nth-child(1) input',
            '100'
          )
          .doubleClick(
            '.rt-tr-group:nth-child(9) .rt-tr:first-child .rt-td:nth-child(2)'
          )
          .setValue(
            '.rt-tr-group:nth-child(9) .rt-tr:first-child .rt-td:nth-child(2) input',
            'Doe'
          )
          .doubleClick(
            '.rt-tr-group:nth-child(9) .rt-tr:first-child .rt-td:nth-child(3)'
          )
          .setValue(
            '.rt-tr-group:nth-child(9) .rt-tr:first-child .rt-td:nth-child(3) input',
            'John'
          )
          .doubleClick(
            '.rt-tr-group:nth-child(10) .rt-tr:first-child .rt-td:nth-child(1)'
          )
          .setValue(
            '.rt-tr-group:nth-child(10) .rt-tr:first-child .rt-td:nth-child(1) input',
            '101'
          )
          .doubleClick(
            '.rt-tr-group:nth-child(10) .rt-tr:first-child .rt-td:nth-child(2)'
          )
          .setValue(
            '.rt-tr-group:nth-child(10) .rt-tr:first-child .rt-td:nth-child(2) input',
            'Doe'
          )
          .doubleClick(
            '.rt-tr-group:nth-child(10) .rt-tr:first-child .rt-td:nth-child(3)'
          )
          .setValue(
            '.rt-tr-group:nth-child(10) .rt-tr:first-child .rt-td:nth-child(3) input',
            'Jane'
          );
        await delay(100);
        await client.click(
          '.rt-tr-group:nth-child(10) .rt-tr:first-child .rt-td:nth-child(4)'
        );

        const name1 = await client.getText(
          '.rt-tr-group:nth-child(9) .rt-tr:first-child .rt-td:nth-child(3)'
        );
        const name2 = await client.getText(
          '.rt-tr-group:nth-child(10) .rt-tr:first-child .rt-td:nth-child(3)'
        );
        expect(name1).toBe('John');
        expect(name2).toBe('Jane');
      });

      // @TODO: Webdriver client.keys is bugged. Had to add a delete button
      it('Should delete rows 6 and 7', async () => {
        const { client } = this.app;
        await client.click(
          '.rt-tr-group:nth-child(6) .rt-tr:first-child .rt-td:first-child'
        );
        await client
          .keys('Shift')
          .click(
            '.rt-tr-group:nth-child(7) .rt-tr:first-child .rt-td:first-child'
          );
        await delay(200);
        await client.click('button=Delete');
        await delay(500);
        await client.click('button=Save');
        await delay(1000);
        await client.click('#refreshIcon');
        await delay(1000);
        const id = await client.getText(
          '.rt-tr-group:nth-child(6) .rt-tr:first-child .rt-td:first-child'
        );
        expect(id).toBe('8');
      });
    });
  });
});
