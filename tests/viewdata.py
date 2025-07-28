from flask import Flask, render_template
import json
import os

app = Flask(__name__)

@app.route('/')
def display_songs():
    # 加载JSON数据
    json_file_path = os.path.join(os.path.dirname(__file__), 'arcade_songs_output.json')
    try:
        with open(json_file_path, 'r', encoding='utf-8') as f:
            songs_data = json.load(f)
    except FileNotFoundError:
        return "错误: 未找到arcade_songs_output.json文件", 404
    except json.JSONDecodeError:
        return "错误: JSON文件格式无效", 500

    return render_template('index.html', groups=songs_data)

if __name__ == '__main__':
    # 确保templates目录存在
    template_dir = os.path.join(os.path.dirname(__file__), 'templates')
    if not os.path.exists(template_dir):
        os.makedirs(template_dir)
    app.run(debug=True, host='0.0.0.0', port=8888)