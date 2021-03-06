// @flow
import React from 'react'
import filesize from 'filesize'

import BagFile from '../js/BagFile'
import {Map} from 'immutable';

class Bag extends React.Component {

    props: {
        files: Map<string, BagFile>
    };

    render() {
        const {files} = this.props

        // $FlowIssue - https://github.com/facebook/flow/issues/1059
        var total = [...files.values()].reduce((r, f) => r + f.fileSize, 0);
        // $FlowIssue - https://github.com/facebook/flow/issues/1059
        let filesValues = [...files.values()]

        return (
            <div id="bag-contents" className="well well-sm">
                <h2>Content
                    <small>
                        &nbsp;{files.size.toLocaleString()} files
                        ({filesize(total, {round: 0})})
                    </small>
                </h2>

                <table className="table table-striped">
                    <caption>
                        Current Contents
                    </caption>
                    <thead>
                        <tr>
                            <th className="file-name">Filename</th>
                            <th className="file-size">Size</th>
                            <th className="file-hash sha256">SHA-256</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filesValues.map(({path, fileSize, hash}) =>
                            <tr key={path}>
                                <td className="file-name">
                                    {path}
                                </td>
                                <td className="file-size">
                                    {fileSize}
                                </td>
                                <td className="file-hash sha256" title={hash}>
                                    {hash}
                                </td>
                            </tr>
                        )}
                    </tbody>
                    <tfoot>
                        <tr>
                            <th>Total:</th>
                            <td className="file-size total">
                                {filesize(total)}
                            </td>
                            <td>
                            </td>
                            <td>
                            </td>
                        </tr>
                    </tfoot>
                </table>

            </div>
        );
    }

}

export default Bag;
