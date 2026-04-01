export type OutputFormat = 'json' | 'table' | 'markdown' | 'text';

export function output(data: any, format: OutputFormat = 'json') {
  switch (format) {
    case 'json':
      console.log(JSON.stringify(data, null, 2));
      break;
    case 'table':
      console.table(data);
      break;
    case 'markdown':
      outputMarkdown(data);
      break;
    case 'text':
      outputText(data);
      break;
  }
}

function outputMarkdown(data: any) {
  if (Array.isArray(data) && data.length > 0) {
    const keys = Object.keys(data[0]);
    console.log('| ' + keys.join(' | ') + ' |');
    console.log('| ' + keys.map(() => '---').join(' | ') + ' |');
    data.forEach(row => {
      console.log('| ' + keys.map(k => row[k] ?? '').join(' | ') + ' |');
    });
  } else if (typeof data === 'object' && data !== null) {
    console.log('| Key | Value |');
    console.log('| --- | --- |');
    Object.entries(data).forEach(([key, value]) => {
      console.log(`| ${key} | ${value} |`);
    });
  } else {
    console.log(data);
  }
}

function outputText(data: any) {
  if (typeof data === 'string') {
    console.log(data);
  } else if (Array.isArray(data)) {
    data.forEach(item => console.log(item));
  } else if (typeof data === 'object' && data !== null) {
    Object.entries(data).forEach(([key, value]) => {
      console.log(`${key}: ${value}`);
    });
  } else {
    console.log(data);
  }
}
